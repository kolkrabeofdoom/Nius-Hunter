import React, { useState } from 'react';
import { X, Shield, Cpu, Activity, Zap, Calculator, Layout, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocOverlayProps {
  onClose: () => void;
}

type TabType = 'FEATURES' | 'ALGORITHMEN' | 'HINTERGRUND';

export default function DocOverlay({ onClose }: DocOverlayProps) {
  const [activeTab, setActiveTab] = useState<TabType>('FEATURES');

  return (
    <div className="fixed inset-0 z-[100] bg-cyber-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-8 overflow-hidden animate-in fade-in duration-500">
      <div className="w-full max-w-6xl h-full max-h-[900px] bg-[#0c111d] border border-slate-800 rounded-[2.5rem] shadow-[0_0_150px_rgba(0,242,255,0.05)] flex flex-col relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-800/50">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.1)]">
              <Info className="w-7 h-7 text-neon-blue" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black uppercase tracking-[0.15em] text-white">System-Dokumentation</h2>
                <span className="px-3 py-1 bg-neon-blue text-cyber-black text-[10px] font-black rounded-md tracking-tighter shadow-[0_0_15px_rgba(0,242,255,0.5)]">
                  V1.2 // STABLE
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Forensische Analyse & Strategische Interaktion</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-slate-800/30 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700/50 transition-all border border-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mt-6">
          <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/50 flex gap-2">
            {[
              { id: 'FEATURES', icon: Zap, label: 'FEATURES' },
              { id: 'ALGORITHMEN', icon: Calculator, label: 'ALGORITHMEN' },
              { id: 'HINTERGRUND', icon: Layout, label: 'HINTERGRUND' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center gap-3 px-8 py-3 rounded-xl text-[11px] font-black tracking-widest transition-all
                  ${activeTab === tab.id 
                    ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/30 shadow-[0_0_20px_rgba(0,242,255,0.1)]' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent'}
                `}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-neon-blue' : 'text-slate-600'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'FEATURES' && (
                <div className="grid md:grid-cols-2 gap-8 pb-12">
                  {[
                    {
                      title: "Echtzeit Netzwerk-Visualisierung",
                      desc: "Dynamische Graphen-Engine basierend auf D3.js. Visualisiert Interaktionen (Quotes/Replies) als bidirektionale Kanten. Knotengröße korreliert mit dem 'Zentralitäts-Gewicht' (Einfluss im Narrativ).",
                      icon: Layers
                    },
                    {
                      title: "Community & Cluster Erkennung",
                      desc: "Nutzt Label-Propagation Algorithmen zur Identifizierung homogener Sub-Netzwerke. Automatische Klassifizierung in 'Echo-Kammern', 'Brücken-Accounts' und 'Isolierte Akteure'.",
                      icon: Target
                    },
                    {
                      title: "KI-Gestützte Sentiment-Analyse",
                      desc: "Deep-Integration von Google Gemini 1.5. Analysiert semantische Muster, Absichten und toxische Narrative über den gesamten Scan-Kontext hinweg.",
                      icon: Brain
                    },
                    {
                      title: "Narrative Tracking",
                      desc: "Vergleichs-Engine für Zeitreihen. Ermöglicht das Tracking von Reichweiten-Entwicklung und die Identifizierung neuer Knoten in einem 24h-Fenster.",
                      icon: History
                    },
                    {
                      title: "Bot- & Sockenpuppen Forensik",
                      desc: "Mehrstufige Detektion koordinierter Inauthentizität. Analysiert zeitliche Synchronität (Burst-Detektion) und Account-Metadaten zur Score-Berechnung.",
                      icon: Cpu
                    },
                    {
                      title: "Strategische Intervention",
                      desc: "Simuliert die Auswirkungen von Blockaden auf die Netzwerk-Integrität. Generiert automatisierte Dossiers und exportierbare Blocklisten.",
                      icon: Shield
                    }
                  ].map((feature, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-slate-900/20 border border-slate-800/40 hover:border-slate-700/60 transition-all group relative">
                      <div className="absolute top-8 left-8 w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center group-hover:bg-neon-blue/10 transition-colors">
                        <feature.icon className="w-5 h-5 text-slate-500 group-hover:text-neon-blue transition-colors" />
                      </div>
                      <div className="pl-14 space-y-3">
                        <h4 className="text-[13px] font-black uppercase tracking-wider text-slate-200">{feature.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ALGORITHMEN' && (
                <div className="max-w-4xl mx-auto space-y-10 pb-12">
                  <div className="space-y-8">
                    {[
                      {
                        title: "Node Weight (Einfluss-Score)",
                        formula: "W = Σ (Replies * 1.0) + (Quotes * 1.5) + (Followers_Norm * 0.5)",
                        desc: "Der Score berechnet die relative Wichtigkeit eines Knotens als Informations-Hub innerhalb des spezifischen Narrativs."
                      },
                      {
                        title: "Bot-Wahrscheinlichkeit",
                        formula: "P(bot) = (Synch_Index * 0.4) + (Freq_Index * 0.3) + (Meta_Age_Index * 0.3)",
                        desc: "Kombiniert die zeitliche Koordination mit der Account-Historie. Ein hoher Wert deutet auf automatisierte oder hochgradig gesteuerte Accounts hin."
                      },
                      {
                        title: "Impact-Analyse",
                        formula: "I = Δ(Global_Clustering_Coef) nach Entfernung des Knotens",
                        desc: "Misst, wie stark der Zusammenhalt des Netzwerks sinkt, wenn dieser spezifische Knoten (oder eine Gruppe) entfernt wird."
                      }
                    ].map((alg, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_8px_#00f2ff]"></div>
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-neon-blue">{alg.title}</h4>
                        </div>
                        <div className="p-6 bg-cyber-black border border-slate-800/60 rounded-2xl font-mono text-sm text-slate-300 shadow-inner">
                          {alg.formula}
                        </div>
                        <p className="text-[11px] text-slate-500 italic pl-5">{alg.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800/50 space-y-6">
                    <div className="flex items-center gap-3 text-neon-blue">
                      <Calculator className="w-5 h-5" />
                      <h4 className="text-[12px] font-black uppercase tracking-widest">Daten-Quellen & Validierung</h4>
                    </div>
                    <ul className="space-y-4">
                      {[
                        "Live-Stream über das AT Protocol (Bluesky).",
                        "Toxizität wird durch Pattern-Matching und LLM-Validierung (Gemini) verifiziert.",
                        "Synchronitäts-Cluster werden mit einem Zeitfenster von maximal 600s Abweichung berechnet."
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4 text-[11px] text-slate-400 font-medium">
                          <span className="text-neon-blue mt-0.5">›</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'HINTERGRUND' && (
                <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto text-center space-y-10 pb-12">
                  <div className="w-24 h-24 rounded-full bg-neon-blue/5 border border-neon-blue/20 flex items-center justify-center shadow-[0_0_50px_rgba(0,242,255,0.1)]">
                    <Shield className="w-10 h-10 text-neon-blue" />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black uppercase tracking-[0.3em] text-white">Nius Hunter OS</h3>
                    <p className="text-sm font-bold text-slate-500 italic">
                      "Wahrheit ist kein Zufall, sondern das Ergebnis von Daten-Integrität und forensischer Präzision."
                    </p>
                  </div>

                  <div className="space-y-6 text-sm text-slate-400 leading-relaxed font-medium">
                    <p>
                      Nius Hunter wurde entwickelt, um Journalisten, Analysten und zivilgesellschaftlichen Akteuren ein Werkzeug an die Hand zu geben, 
                      das die Mechanismen moderner Desinformation und koordinierter Inauthentizität sichtbar macht.
                    </p>
                    <p>
                      In einer Ära, in der Narrative oft künstlich aufgebläht werden, liefert dieses System die notwendige Transparenz, um 
                      organische Diskurse von gesteuerten Kampagnen zu unterscheiden.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Area */}
        <div className="px-10 py-8 border-t border-slate-800/50 flex items-center justify-between bg-slate-900/20 mt-auto">
          <div className="flex gap-10">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Security Status</span>
              <div className="text-[10px] font-black text-neon-green uppercase tracking-tighter flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></span>
                Encrypted // Active
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">System Load</span>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                Optimal
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-10 py-4 bg-neon-blue text-cyber-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all shadow-[0_0_30px_rgba(0,242,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Terminal Schließen
          </button>
        </div>

      </div>
    </div>
  );
}

// Sub-components for icons that were missing or need to be consistent
const Layers = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
const Target = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
const Brain = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A5 5 0 0 1 12 4.5 5 5 0 0 1 14.5 2 5 5 0 0 1 21 6.5 5 5 0 0 1 17.5 11h-11A5 5 0 0 1 3 6.5 5 5 0 0 1 9.5 2z" /><path d="M12 13v7" /><path d="M16 13l-4 4-4-4" /></svg>; 
const History = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>;
