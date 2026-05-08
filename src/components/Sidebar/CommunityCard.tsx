import React from 'react';
import { Community } from '../../utils/communities';
import { HelpCircle } from 'lucide-react';

interface CommunityCardProps {
  communities: Community[];
  onHelpClick: (id: string) => void;
}

export default function CommunityCard({ communities, onHelpClick }: CommunityCardProps) {
  return (
    <div className="space-y-3">
      {communities.map(community => (
        <div key={community.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                style={{ backgroundColor: community.color }}
              ></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                {community.name}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">{community.nodes.length} Nodes</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
            {community.description}
          </p>
        </div>
      ))}
      
      <button 
        onClick={() => onHelpClick('communities')}
        className="w-full py-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-neon-blue transition-colors"
      >
        <HelpCircle className="w-3 h-3" /> Was bedeuten diese Cluster?
      </button>
    </div>
  );
}
