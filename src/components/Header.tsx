import { Network, SlidersHorizontal, Loader2, Info } from 'lucide-react';

interface HeaderProps {
  handleInput: string;
  setHandleInput: (val: string) => void;
  isLoading: boolean;
  onSearch: (e: React.FormEvent) => void;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  onShowDoc: () => void;
}

export default function Header({ 
  handleInput, 
  setHandleInput, 
  isLoading, 
  onSearch, 
  showSettings, 
  setShowSettings,
  onShowDoc
}: HeaderProps) {
  return (
    <header className="h-20 bg-cyber-dark border-b border-slate-800 px-4 md:px-8 flex items-center justify-between shrink-0 z-20 shadow-lg relative">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-neon-blue rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,242,255,0.4)] cursor-pointer hover:scale-105 transition-transform" onClick={onShowDoc}>
          <Network className="w-6 h-6 text-cyber-black" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block leading-none">
            NIUS HUNTER
          </h1>
          <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase hidden sm:block mt-1">
            Cyber-Sleuth Protocol
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-1 sm:flex-none justify-end">
        <button 
          onClick={onShowDoc}
          className="p-2.5 rounded-full transition-all border bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
          title="Dokumentation & Hilfe"
        >
          <Info className="w-4 h-4" />
        </button>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2.5 rounded-full transition-all border ${
            showSettings 
              ? 'bg-neon-blue/10 border-neon-blue text-neon-blue shadow-[0_0_10px_rgba(0,242,255,0.2)]' 
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
          }`}
          title="Analyseeinstellungen"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        
        <form onSubmit={onSearch} className="relative w-full max-w-[200px] sm:max-w-none sm:w-80">
          <input 
            type="text" 
            placeholder="System-Scan Target..." 
            value={handleInput}
            onChange={(e) => setHandleInput(e.target.value)}
            className="w-full pl-4 pr-24 py-2.5 bg-slate-900 border border-slate-800 focus:bg-cyber-dark focus:border-neon-blue rounded-full text-sm outline-none transition-all shadow-inner text-white"
            required
          />
          <button 
            type="submit"
            disabled={isLoading || !handleInput.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-neon-blue text-cyber-black rounded-full text-xs font-bold hover:bg-white disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(0,242,255,0.3)]"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'INITIALIZE'}
          </button>
        </form>
      </div>
    </header>
  );
}
