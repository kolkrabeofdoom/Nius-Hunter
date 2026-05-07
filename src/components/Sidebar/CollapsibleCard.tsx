import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleCard({ title, subtitle, icon, children, defaultOpen = true }: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-cyber-dark/50 border border-slate-800 rounded-2xl overflow-hidden transition-all hover:border-slate-700">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">{title}</h3>
            {subtitle && <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{subtitle}</p>}
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      
      {isOpen && (
        <div className="p-4 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-slate-800 mb-4"></div>
          {children}
        </div>
      )}
    </div>
  );
}
