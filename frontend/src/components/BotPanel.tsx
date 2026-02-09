import { Power, Cpu } from 'lucide-react';

interface Props {
  isBotActive: boolean;
  setIsBotActive: (val: boolean) => void;
  botThreshold: number;
  setBotThreshold: (val: number) => void;
}

export default function BotPanel({ isBotActive, setIsBotActive, botThreshold, setBotThreshold }: Props) {
  return (
    <div className={`glass-panel rounded-xl p-5 transition-all duration-500 relative overflow-hidden
      ${isBotActive ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-slate-700/50'}`}>
      
      {/* Background Pulse Effect when Active */}
      {isBotActive && <div className="absolute inset-0 bg-purple-500/5 animate-pulse"></div>}

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Cpu size={18} className={isBotActive ? "text-purple-400" : "text-slate-500"} />
            AUTO-SNIPER
          </h3>
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isBotActive ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
            {isBotActive ? 'RUNNING' : 'IDLE'}
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Profit Threshold</span>
            <span className="text-white font-mono">{botThreshold}%</span>
          </div>
          <input 
            type="range" min="0.5" max="5" step="0.1" 
            value={botThreshold}
            onChange={(e) => setBotThreshold(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
          />
        </div>

        <button 
          onClick={() => setIsBotActive(!isBotActive)}
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300
            ${isBotActive 
              ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/25 border border-transparent'}`}
        >
          <Power size={18} />
          {isBotActive ? "TERMINATE PROCESS" : "INITIALIZE BOT"}
        </button>
      </div>
    </div>
  );
}