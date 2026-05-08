import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'rose';
  isLoading?: boolean;
}

export default function StatCard({ title, value, icon: Icon, trend, color, isLoading }: StatCardProps) {
  const colorMap = {
    blue: 'text-neon-blue bg-neon-blue/10 border-neon-blue/20',
    green: 'text-neon-green bg-neon-green/10 border-neon-green/20',
    purple: 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-3xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-slate-700 transition-all"
    >
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">
            {trend}
          </span>
        )}
      </div>

      <div>
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</h4>
        {isLoading ? (
          <div className="h-8 w-24 bg-slate-800 animate-pulse rounded-lg"></div>
        ) : (
          <div className="text-2xl font-black text-white tracking-tight">{value}</div>
        )}
      </div>

      {/* Decorative Gradient Glow */}
      <div className={`absolute -bottom-10 -right-10 w-24 h-24 blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity rounded-full bg-current ${colorMap[color].split(' ')[0]}`}></div>
    </motion.div>
  );
}
