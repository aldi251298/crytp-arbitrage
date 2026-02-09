import { Clock } from 'lucide-react'; // Hapus Trash2
// TAMBAHKAN KATA 'type' DI SINI
import type { TradeLog } from '../types';

interface Props {
  history: TradeLog[];
}

export default function HistoryPanel({ history }: Props) {
  return (
    <div className="bg-[#1e2329] rounded-xl border border-gray-800 flex-1 flex flex-col min-h-[300px]">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Clock size={16} className="text-gray-500" /> DB HISTORY
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-2 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center text-gray-600 py-10 text-xs">No trades recorded in database.</div>
        ) : (
          history.map((log) => (
            <div key={log.id} className="bg-[#252a33] p-3 rounded border border-gray-700/50 flex justify-between items-center text-xs animate-in fade-in slide-in-from-right-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${log.type === "AUTO" ? "text-purple-400" : "text-blue-400"}`}>
                    {log.type}
                  </span>
                  <span className="text-gray-500 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white font-bold mt-0.5">BUY {log.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-mono font-bold">+$ {log.profit.toFixed(2)}</p>
                <p className="text-[10px] text-gray-500">Saved to DB</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}