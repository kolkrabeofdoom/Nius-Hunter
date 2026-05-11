import React, { useState } from 'react';
import { Cpu, HelpCircle, Info, Radio, Link as LinkIcon, Users, Fingerprint, Calendar, ExternalLink } from 'lucide-react';
import { ForensicsResults } from '../../utils/forensics';
import ForensicsDetailOverlay from '../ForensicsDetailOverlay';

interface ForensicsCardProps {
  forensics: ForensicsResults | null;
  graphData: any | null;
  onHelpClick: (id: string) => void;
}

export default function ForensicsCard({ forensics, graphData, onHelpClick }: ForensicsCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="space-y-5 relative">
      <div className="absolute -top-12 -right-2 p-2 opacity-5 pointer-events-none">
         <Radio className="w-12 h-12 text-neon-green" />
      </div>
      
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Cpu className="w-3 h-3 text-neon-green" /> Forensik Analyse
        </h3>
        <button 
          onClick={() => setShowDetail(true)}
          className="px-3 py-1 bg-neon-green/10 hover:bg-neon-green/20 text-neon-green text-[9px] font-black rounded-lg border border-neon-green/30 transition-all flex items-center gap-1.5 uppercase tracking-widest"
        >
          Details <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Synchronicity */}
        <div className="group cursor-help" onClick={() => onHelpClick('coordination')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2">
              Synchronität / Koordination <Info className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-neon-blue" />
            </span>
            <span className="text-[10px] text-neon-blue font-mono font-bold">{forensics?.coordinatedNodeIds?.length || 0} IDs</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
            <div 
              className="h-full bg-neon-blue shadow-[0_0_10px_#00f2ff]" 
              style={{ width: `${Math.min(100, (forensics?.coordinatedNodeIds?.length || 0) * 10)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-slate-800/50 pt-4">
           <div className="group cursor-help" onClick={() => onHelpClick('bot_density')}>
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 block">
                Bot-Dichte
              </span>
              <div className="text-sm font-mono font-black text-neon-purple">
                {(forensics?.botDensity ?? 0).toFixed(1)}%
              </div>
           </div>
           <div className="group cursor-help" onClick={() => onHelpClick('suspect_score')}>
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 block">
                Ø Suspect Score
              </span>
              <div className={`text-sm font-mono font-black ${forensics && (forensics.avgSuspectScore ?? 0) > 50 ? 'text-amber-500' : 'text-slate-200'}`}>
                 {(forensics?.avgSuspectScore ?? 0).toFixed(1)}
              </div>
           </div>
           <div className="group cursor-help" onClick={() => onHelpClick('stability')}>
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 block">
                Stabilität
              </span>
              <div className="text-sm font-mono font-black text-neon-green">
                {(forensics?.networkDensity ?? 0).toFixed(1)}%
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="group cursor-help" onClick={() => onHelpClick('toxicity')}>
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 block">
                Ø Toxizität
              </span>
              <div className={`text-sm font-mono font-black ${forensics && (forensics.avgToxicity ?? 0) > 40 ? 'text-rose-500' : 'text-slate-200'}`}>
                 {(forensics?.avgToxicity ?? 0).toFixed(0)}%
              </div>
           </div>
           <div className="group cursor-help" onClick={() => onHelpClick('reach')}>
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 block">
                 Reichweite
              </span>
              <div className="text-sm font-mono font-black text-slate-300">
                 {(forensics?.totalReach || 0).toLocaleString()}
              </div>
           </div>
        </div>

        {/* Temporal Bursts */}
        {forensics?.burstClusters && forensics.burstClusters.length > 0 && (
          <div className="border-t border-slate-800/50 pt-4 group cursor-help" onClick={() => onHelpClick('bursts')}>
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
              Aktivitäts-Bursts (10min) <Info className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
            </span>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {forensics.burstClusters.slice(0, 5).map((burst, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px] bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                  <span className="text-amber-200/70 font-mono">
                    {burst.time.split(' ')[1]}
                  </span>
                  <span className="text-amber-500 font-bold font-mono">+{burst.count} Accounts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Sources */}
        {forensics?.topLinks && forensics.topLinks.length > 0 && (
          <div className="border-t border-slate-800/50 pt-4 group cursor-help" onClick={() => onHelpClick('sources')}>
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
              Datenquellen <Info className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-neon-green" />
            </span>
            <div className="space-y-2">
              {forensics.topLinks.slice(0, 3).map((link, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-900/40 p-1.5 rounded-lg border border-slate-800/50">
                  <span className="text-slate-400 truncate max-w-[140px] flex items-center gap-2">
                    <LinkIcon className="w-2.5 h-2.5 text-slate-600" /> {link.url}
                  </span>
                  <span className="text-neon-green font-mono font-bold">{link.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sockpuppets */}
        {forensics?.sockpuppetGroups && forensics.sockpuppetGroups.length > 0 && (
          <div className="border-t border-slate-800/50 pt-4 group cursor-help" onClick={() => onHelpClick('sockpuppets')}>
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
              Sockenpuppen <Info className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-neon-purple" />
            </span>
            <div className="flex items-center gap-3 text-xs text-neon-purple bg-neon-purple/10 border border-neon-purple/20 p-2 rounded-lg">
              <Users className="w-4 h-4" />
              <span className="font-bold">{forensics.sockpuppetGroups.length} Gruppen identifiziert</span>
            </div>
          </div>
        )}

        {/* Metadata Fingerprinting (Method 4) */}
        {(forensics?.fingerprintClusters?.length || 0) > 0 || (forensics?.batchCreationGroups?.length || 0) > 0 ? (
          <div className="border-t border-slate-800/50 pt-4 group cursor-help" onClick={() => onHelpClick('fingerprinting')}>
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
              Metadata Fingerprinting <Info className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-neon-green" />
            </span>
            <div className="space-y-2">
              {forensics?.fingerprintClusters?.slice(0, 2).map((cluster, idx) => (
                <div key={`fp-${idx}`} className="flex items-center justify-between text-[10px] bg-neon-green/5 p-2 rounded-lg border border-neon-green/20">
                  <span className="text-neon-green/70 flex items-center gap-1.5 truncate">
                    <Fingerprint className="w-3 h-3" /> {cluster.domain}
                  </span>
                  <span className="text-neon-green font-bold font-mono">{cluster.nodeIds.length} IDs</span>
                </div>
              ))}
              {forensics?.batchCreationGroups?.slice(0, 2).map((group, idx) => (
                <div key={`batch-${idx}`} className="flex items-center justify-between text-[10px] bg-slate-800/30 p-2 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> {group.date}
                  </span>
                  <span className="text-slate-300 font-bold font-mono">{group.nodeIds.length} New</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {showDetail && (
        <ForensicsDetailOverlay 
          forensics={forensics} 
          graphData={graphData}
          onClose={() => setShowDetail(false)} 
        />
      )}
    </div>
  );
}
