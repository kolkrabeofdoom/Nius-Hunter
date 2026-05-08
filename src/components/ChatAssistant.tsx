import React from 'react';
import { Terminal, Send, X, Cpu, Loader2 } from 'lucide-react';

interface ChatAssistantProps {
  isChatOpen: boolean;
  setIsChatOpen: (val: boolean) => void;
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[];
  chatInput: string;
  setChatInput: (val: string) => void;
  onSendChat: (e: React.FormEvent) => void;
  isChatTyping: boolean;
}

export default function ChatAssistant({
  isChatOpen,
  setIsChatOpen,
  chatHistory,
  chatInput,
  setChatInput,
  onSendChat,
  isChatTyping
}: ChatAssistantProps) {
  if (!isChatOpen) {
    return (
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-neon-blue text-cyber-black rounded-full shadow-[0_0_20px_rgba(0,242,255,0.4)] flex items-center justify-center hover:scale-110 transition-all z-40 group"
      >
        <Terminal className="w-6 h-6 group-hover:animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] max-w-[400px] h-[500px] bg-cyber-dark/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-8 duration-300">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neon-blue/10 rounded-lg flex items-center justify-center border border-neon-blue/30">
            <Cpu className="w-4 h-4 text-neon-blue" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Sleuth Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">AI Analysis Active</span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-white transition-colors p-1">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {chatHistory.length === 0 && (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
               <Terminal className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-6">
              Stellen Sie Fragen zum identifizierten Netzwerk oder zu spezifischen Akteuren.
            </p>
          </div>
        )}
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-neon-blue text-cyber-black font-bold shadow-[0_0_15px_rgba(0,242,255,0.2)]' 
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              {msg.parts[0].text}
            </div>
          </div>
        ))}
        {isChatTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl flex items-center gap-2">
              <Loader2 className="w-3 h-3 text-neon-blue animate-spin" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Verarbeite...</span>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={onSendChat} className="p-4 border-t border-slate-800">
        <div className="relative">
          <input 
            type="text" 
            placeholder="System-Anfrage eingeben..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-slate-900 border border-slate-800 focus:border-neon-blue rounded-xl text-xs outline-none transition-all text-white"
          />
          <button 
            type="submit"
            disabled={!chatInput.trim() || isChatTyping}
            className="absolute right-2 top-1.5 bottom-1.5 w-9 bg-neon-blue text-cyber-black rounded-lg flex items-center justify-center hover:bg-white disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
