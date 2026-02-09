import { BarChart2, ArrowRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { CoinData } from '../types';

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

interface Props {
  coins: CoinData[];
  onTrade: (coin: CoinData, type: "MANUAL") => void;
}

export default function MarketTable({ coins, onTrade }: Props) {
  return (
    <div className="lg:col-span-3 glass-panel rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
      <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30">
        <h3 className="font-bold text-white flex items-center gap-2">
          <BarChart2 size={18} className="text-blue-500"/> MARKET FEED
        </h3>
        <span className="text-xs text-slate-500 font-mono">LIVE // 500ms</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-slate-400 uppercase tracking-wider bg-slate-900/50">
              <th className="p-4 font-medium">Asset</th>
              <th className="p-4 font-medium text-right">Global</th>
              <th className="p-4 font-medium text-right">Local Est.</th>
              <th className="p-4 font-medium text-right">Spread</th>
              <th className="p-4 font-medium text-center">Score</th>
              <th className="p-4 font-medium w-24 hidden md:table-cell">Trend</th>
              <th className="p-4 font-medium text-center">Exec</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {coins.map((coin) => {
              const isHighProfit = parseFloat(coin.profit) > 2.0;
              return (
                <tr key={coin.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                      {coin.symbol[0]}
                    </div>
                    <div>
                      <span className="block">{coin.symbol}</span>
                      <span className={`text-[10px] ${parseFloat(coin.change24h) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {parseFloat(coin.change24h)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-slate-300">{formatCurrency(coin.price_usd)}</td>
                  <td className="p-4 text-right font-mono text-blue-300">{formatCurrency(coin.price_local)}</td>
                  <td className="p-4 text-right">
                    <span className={`font-bold font-mono px-2 py-1 rounded ${isHighProfit ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'}`}>
                      {coin.profit}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <div className={`h-1.5 w-12 rounded-full ${coin.confidence === 'High' ? 'bg-emerald-500' : coin.confidence === 'Med' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell h-12 opacity-50 group-hover:opacity-100 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={coin.sparkline.map((val, i) => ({ i, val }))}>
                          <Line type="monotone" dataKey="val" stroke={parseFloat(coin.change1h) >= 0 ? "#10B981" : "#EF4444"} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onTrade(coin, "MANUAL")}
                      disabled={parseFloat(coin.profit) <= 0}
                      className="group/btn relative overflow-hidden bg-slate-800 hover:bg-blue-600 text-white p-2 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-slate-800"
                    >
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}