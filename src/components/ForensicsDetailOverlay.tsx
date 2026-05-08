import React from 'react';
import { X, Shield, Cpu, Activity, Zap, Calculator, Fingerprint, Calendar, Link as LinkIcon, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ForensicsResults } from '../utils/forensics';

interface ForensicsDetailOverlayProps {
  forensics: ForensicsResults | null;
  onClose: () => void;
}

export default function ForensicsDetailOverlay({ forensics, onClose }: ForensicsDetailOverlayProps) {
  if (!forensics) return null;

  const scoreLabels = [
    { label: 'NIEDRIG', range: '0-29', color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30' },
    { label: 'MITTEL', range: '30-59', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { label: 'HOCH', range: '60-100', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' }
  ];

  const currentScoreCategory = forensics.avgSuspectScore < 30 ? 0 : forensics.avgSuspectScore < 60 ? 1 : 2;

  return (
    <div className="fixed inset-0 z-[110] bg-cyber-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl h-full max-h-[850px] bg-[#0c111d] border border-slate-800 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/30">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.1)]">
              <Cpu className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black uppercase tracking-widest text-white">Forensik-Deep-Scan</h2>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-black rounded uppercase">Interpretation V2</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Detaillierte Analyse der Koordinierten Inauthentizität</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
          {/* Summary Score */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scoreLabels.map((s, i) => (
              <div key={i} className={`p-6 rounded-3xl border ${s.border} ${s.bg} relative overflow-hidden transition-all ${currentScoreCategory === i ? 'ring-2 ring-white/10 scale-105' : 'opacity-40'}`}>
                {currentScoreCategory === i && (
                  <div className="absolute top-2 right-4">
                    <Activity className={`w-12 h-12 ${s.color} opacity-10`} />
                  </div>
                )}
                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${s.color}`}>{s.label} ({s.range})</div>
                <div className="text-2xl font-black text-white">{i === 0 ? '0 - 29' : i === 1 ? '30 - 59' : '60 - 100'}</div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  {i === 0 ? 'Wahrscheinlich echte Nutzer' : i === 1 ? 'Verdächtig - Manuelle Prüfung empfohlen' : 'Starke Bot-Indikatoren detektiert'}
                </p>
              </div>
            ))}
          </section>

          {/* Analysis Data Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Metadata Fingerprinting */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-neon-green" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Domain & Infrastructure</h3>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Identifizierte Cluster basierend auf gemeinsam genutzten externen Links und PDS-Server-Anomalien. 
                  Hohe Korrelationen deuten auf zentrale Steuerung hin.
                </p>
                <div className="space-y-3">
                  {forensics.fingerprintClusters.length > 0 ? (
                    forensics.fingerprintClusters.map((cluster, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-cyber-black/50 p-3 rounded-xl border border-slate-800/50">
                        <span className="text-xs text-neon-green font-mono flex items-center gap-2">
                          <LinkIcon className="w-3 h-3" /> {cluster.domain}
                        </span>
                        <span className="text-xs font-black text-white">{cluster.nodeIds.length} Accounts</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-600 italic">Keine signifikanten Domain-Cluster gefunden.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Batch Creations */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-neon-blue" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Temporal Batching</h3>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Accounts, die am exakt selben Tag erstellt wurden. Professionelle Kampagnen nutzen oft vorgefertigte "Account-Pakete".
                </p>
                <div className="space-y-3">
                  {forensics.batchCreationGroups.length > 0 ? (
                    forensics.batchCreationGroups.map((group, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-cyber-black/50 p-3 rounded-xl border border-slate-800/50">
                        <span className="text-xs text-neon-blue font-mono">{group.date}</span>
                        <span className="text-xs font-black text-white">{group.nodeIds.length} Neuregistrierungen</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-600 italic">Keine Batch-Registrierungen erkannt.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Scoring Logic Breakdown */}
          <section className="space-y-8">
             <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 text-neon-purple" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Algorithmische Gewichtung (Regelwerk)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Kontoalter', detail: '< 30 Tage', weight: '+40', icon: Calendar },
                  { title: 'Vokalarmut', detail: 'Handle Entropy', weight: '+40', icon: Cpu },
                  { title: 'Follow-Ratio', detail: 'Foll/Foll < 2%', weight: '+25', icon: Users },
                  { title: 'Post-Vakuum', detail: '< 3 Posts', weight: '+20', icon: Activity },
                  { title: 'Synchronität', detail: 'Burst Window', weight: '+35', icon: Zap },
                  { title: 'Sockpuppet', detail: 'Jaccard > 0.8', weight: '+25', icon: Users },
                  { title: 'PDS Server', detail: 'Custom Host', weight: '+15', icon: Shield },
                  { title: 'Avatar', detail: 'Missing Img', weight: '+15', icon: AlertTriangle }
                ].map((rule, i) => (
                  <div key={i} className="p-4 bg-slate-900/20 border border-slate-800/30 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <rule.icon className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="text-[10px] font-black text-slate-300 uppercase">{rule.title}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{rule.detail}</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-black text-neon-purple">{rule.weight}</div>
                  </div>
                ))}
              </div>
          </section>

          {/* Interpretation Summary */}
          <section className="p-8 rounded-[2.5rem] bg-neon-blue/5 border border-neon-blue/10 space-y-6">
            <div className="flex items-center gap-3 text-neon-blue">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-sm font-black uppercase tracking-widest">Sleuth Interpretation</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-8 text-xs leading-relaxed text-slate-300">
              <div className="space-y-4">
                <p>
                  Das Netzwerk weist eine <span className="text-white font-bold">Bot-Dichte von {forensics.botDensity.toFixed(1)}%</span> auf. 
                  In Kombination mit einem durchschnittlichen Suspect-Score von <span className="text-white font-bold">{forensics.avgSuspectScore.toFixed(1)}</span>
                  deutet dies auf eine signifikante Infiltrierung durch künstliche Verstärker hin.
                </p>
                <p>
                  Besonders kritisch ist die <span className="text-neon-purple font-bold">Sockpuppen-Erkennung</span>: Es wurden {forensics.sockpuppetGroups.length} Gruppen 
                  identifiziert, die mit hoher Wahrscheinlichkeit von derselben Instanz betrieben werden.
                </p>
              </div>
              <div className="space-y-4 p-5 bg-cyber-black/50 rounded-2xl border border-slate-800/50">
                <h5 className="text-[10px] font-black uppercase text-neon-blue mb-2">Empfohlene Strategie</h5>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                    <span>Exportiere die Blockliste für alle Accounts mit Score &gt; 60.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                    <span>Fokussiere Gegenmaßnahmen auf die identifizierten Batch-Creation Daten.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 border-t border-slate-800/50 flex justify-end bg-slate-900/30">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl uppercase tracking-widest transition-all"
          >
            Analyse Schließen
          </button>
        </div>
      </motion.div>
    </div>
  );
}
