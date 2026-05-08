import React from 'react';
import { ScanComparison } from '../../utils/history';
import { ArrowUpRight, ArrowDownRight, Users, Zap } from 'lucide-react';

interface ComparisonCardProps {
  comparison: ScanComparison;
  oldTimestamp: string | null;
}

export default function ComparisonCard({ comparison, oldTimestamp }: ComparisonCardProps) {
  return (
    <div className="space-y-4">
      <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">
        Snapshot vom: {oldTimestamp ? new Date(oldTimestamp).toLocaleString() : 'Unbekannt'}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3 h-3 text-neon-blue" />
            <span className="text-[9px] font-black uppercase text-slate-400">Netz-Wachstum</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono text-white">
              {comparison.nodeCountDelta >= 0 ? '+' : ''}{comparison.nodeCountDelta}
            </span>
            {comparison.nodeCountDelta > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-emerald-500" />
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-neon-purple" />
            <span className="text-[9px] font-black uppercase text-slate-400">Ø Toxizität</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono text-white">
              {comparison.toxicityDelta >= 0 ? '+' : ''}{comparison.toxicityDelta.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      {comparison.newNodes.length > 0 && (
        <div className="text-[9px] text-slate-400 italic">
          {comparison.newNodes.length} neue Akteure seit letztem Scan identifiziert.
        </div>
      )}
    </div>
  );
}
