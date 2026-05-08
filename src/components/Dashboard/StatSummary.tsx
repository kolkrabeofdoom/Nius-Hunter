import React from 'react';
import { Shield, Activity, Users, Zap, Target } from 'lucide-react';
import StatCard from './StatCard';
import { ForensicsResults } from '../../utils/forensics';

interface StatSummaryProps {
  forensics: ForensicsResults | null;
  isLoading: boolean;
}

export default function StatSummary({ forensics, isLoading }: StatSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <StatCard 
        title="Bot-Dichte"
        value={forensics ? `${forensics.botDensity.toFixed(1)}%` : '0%'}
        icon={Shield}
        color="rose"
        trend={forensics && forensics.botDensity > 30 ? "HOCH" : "NORMAL"}
        isLoading={isLoading}
      />
      <StatCard 
        title="Ø Suspect Score"
        value={forensics ? forensics.avgSuspectScore.toFixed(0) : '0'}
        icon={Target}
        color="amber"
        isLoading={isLoading}
      />
      <StatCard 
        title="Netz-Stabilität"
        value={forensics ? `${(forensics.networkDensity * 100).toFixed(1)}%` : '0%'}
        icon={Activity}
        color="blue"
        isLoading={isLoading}
      />
      <StatCard 
        title="Brutto-Reichweite"
        value={forensics ? forensics.totalReach.toLocaleString() : '0'}
        icon={Users}
        color="purple"
        isLoading={isLoading}
      />
      <StatCard 
        title="Burst-Aktivität"
        value={forensics ? forensics.burstClusters.length : '0'}
        icon={Zap}
        color="green"
        trend="Live"
        isLoading={isLoading}
      />
    </div>
  );
}
